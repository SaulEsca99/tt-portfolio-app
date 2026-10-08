"""C2 — los hiperparámetros se validan (tipo, rango y costo total) antes de ejecutar."""
import pytest
from sqlalchemy import func, select

from app.db.models import OptimizationRun
from app.optimization.runner import ParamError, build_config, validate_params


@pytest.mark.parametrize("algo,params", [
    ("ga", {"population_size": 0}),
    ("ga", {"population_size": 10**9}),
    ("ga", {"population_size": True}),
    ("ga", {"population_size": "abc"}),
    ("ga", {"population_size": 50.5}),
    ("ga", {"generations": -5}),
    ("ga", {"mutation_rate": 1.5}),
    ("ga", {"elitism": 60}),
    ("ga", {"population_size": 20, "elitism": 15}),
    ("ga", {"population_size": 500, "generations": 1000}),
    ("ga", {"seed": -1}),
    ("pso", {"num_particles": 5}),
    ("pso", {"inertia_weight": 3}),
    ("pso", {"num_particles": 500, "max_iterations": 500}),
    ("de", {"mutation_factor": 5}),
    ("de", {"max_generations": 5000}),
    ("de", {"strategy": "best/1/bin"}),
])
def test_invalid_params_rejected(algo, params):
    with pytest.raises(ParamError):
        validate_params(algo, params)


def test_params_must_be_object():
    with pytest.raises(ParamError):
        validate_params("ga", [1, 2])


def test_valid_params_pass_and_foreign_keys_dropped():
    clean = validate_params("ga", {"population_size": 40.0, "generations": 30,
                                   "num_particles": 9999, "mutation_factor": 99, "seed": 7})
    assert clean == {"population_size": 40, "generations": 30, "seed": 7}
    assert validate_params("de", None) == {}
    assert validate_params("pso", {"max_iterations": None}) == {}


def test_build_config_uses_validated_values():
    cfg = build_config("pso", {"num_particles": 25, "max_iterations": 40})
    assert cfg.num_particles == 25 and cfg.max_iterations == 40
    with pytest.raises(ParamError):
        build_config("pso", {"num_particles": 0})


async def test_endpoint_returns_422_and_creates_no_run(client, session_factory):
    async def runs():
        async with session_factory() as db:
            return (await db.execute(select(func.count()).select_from(OptimizationRun))).scalar_one()

    before = await runs()
    for bad in ({"population_size": 0}, {"population_size": 10**9}, {"generations": "x"}):
        r = await client.post("/optimize", json={"portfolio_id": client.portfolio_id,
                                                 "algorithm": "ga", "params": bad})
        assert r.status_code == 422, r.text
    assert await runs() == before


def test_de_default_generations_scale_with_n():
    """C3 — sin 'max_generations' DE usa max(200, 12·N) generaciones."""
    import numpy as np

    from app.optimization import de
    n = 30
    A = np.random.default_rng(0).normal(size=(n, n)); sg = A @ A.T / n * 0.05 + np.eye(n) * 0.02
    res = de.optimize([f"A{i}" for i in range(n)], np.linspace(0.02, 0.12, n), sg,
                      config=de.DEConfig(population_size=10))
    assert len(res.convergence_history) == max(200, 12 * n)
    assert validate_params("de", {"population_size": 500}) == {"population_size": 500}


def test_pso_new_params_validated_and_runs():
    import numpy as np

    from app.optimization import pso
    assert validate_params("pso", {"inertia_end": 0.3, "stagnation_limit": 10}) == {
        "inertia_end": 0.3, "stagnation_limit": 10}
    with pytest.raises(ParamError):
        validate_params("pso", {"stagnation_limit": 1})
    n = 8
    sg = np.diag(np.linspace(0.01, 0.06, n))
    res = pso.optimize([f"A{i}" for i in range(n)], np.linspace(0.02, 0.1, n), sg,
                       config=pso.PSOConfig(num_particles=20, max_iterations=60, stagnation_limit=5))
    assert sum(res.weights.values()) == pytest.approx(1.0, abs=1e-9)
