import uuid

import pytest
from sqlalchemy import select

from app.db.models import OptimizationResult, OptimizationRun


FAST = {"population_size": 30, "generations": 30, "num_particles": 30,
        "max_iterations": 30, "max_generations": 30}


@pytest.mark.parametrize("algo", ["ga", "pso", "de"])
async def test_optimize_persists_and_respects_constraints(client, session_factory, algo):
    r = await client.post("/optimize", json={
        "portfolio_id": client.portfolio_id, "algorithm": algo, "params": FAST})
    assert r.status_code == 200, r.text
    body = r.json()
    ws = [w["weight"] for w in body["weights"]]
    assert sum(ws) == pytest.approx(1.0, abs=1e-4)
    assert max(ws) <= 0.6 + 1e-6
    assert len(ws) <= 3                      # max_assets del portafolio
    assert body["muSource"] == "historical"

    async with session_factory() as db:
        run = (await db.execute(select(OptimizationRun).where(
            OptimizationRun.id == uuid.UUID(body["optimizationRunId"])))).scalar_one()
        assert run.status == "done" and run.completed_at is not None
        rows = (await db.execute(select(OptimizationResult).where(
            OptimizationResult.optimization_run_id == run.id))).scalars().all()
        assert len(rows) == len(ws)


async def test_unknown_portfolio_404(client):
    r = await client.post("/optimize", json={"portfolio_id": str(uuid.uuid4())})
    assert r.status_code == 404


async def test_requires_api_key(client):
    r = await client.post("/optimize", json={"portfolio_id": client.portfolio_id},
                          headers={"Authorization": "Bearer wrong"})
    assert r.status_code == 401
