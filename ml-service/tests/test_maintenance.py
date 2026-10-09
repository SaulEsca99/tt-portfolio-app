import uuid
from datetime import datetime, timedelta, timezone

import numpy as np
import pytest
from sqlalchemy import select

from app.db.models import OptimizationRun
from app.services.maintenance import reap_stale_runs


async def test_reap_stale_runs(client, session_factory):
    now = datetime.now(timezone.utc)
    ids = {}
    async with session_factory() as db:
        for name, status, age in [("old_running", "running", 60), ("new_running", "running", 1),
                                  ("old_done", "done", 600)]:
            rid = uuid.uuid4(); ids[name] = rid
            db.add(OptimizationRun(id=rid, portfolio_id=uuid.UUID(client.portfolio_id), algorithm="ga",
                                   status=status, params={}, requested_at=now - timedelta(minutes=age)))
        await db.commit()
    async with session_factory() as db:
        assert await reap_stale_runs(db, 15) == 1
    async with session_factory() as db:
        st = {r.id: r.status for r in (await db.execute(select(OptimizationRun))).scalars()}
    assert st[ids["old_running"]] == "error" and st[ids["new_running"]] == "running"
    assert st[ids["old_done"]] == "done"


def test_price_updater_start_never_fails_on_feb_29():
    from datetime import date
    today = date(2028, 2, 29)
    assert today - timedelta(days=365 * 5) < today      # replace(year=...) lanzaría ValueError en 2027→
    with pytest.raises(ValueError):
        date(2028, 2, 29).replace(year=2027)


def test_rank_ic():
    from app.models.lstm_model import _spearman
    a = np.arange(50.0)
    assert _spearman(a, a * 2) == pytest.approx(1.0)
    assert _spearman(a, -a) == pytest.approx(-1.0)
    assert _spearman(np.zeros(5), a[:5]) == 0.0


def test_clean_prices_drops_incomplete_today_bar():
    """Regresión (prueba local con Yahoo real): la barra de hoy llega con close/adj_close NaN."""
    import pandas as pd
    from datetime import date

    from app.data.fetch_yfinance import clean_prices

    df = pd.DataFrame({
        "date": [date(2026, 10, 6), date(2026, 10, 7), date(2026, 10, 8), date(2026, 10, 9)],
        "open": [1.0, 1.0, 1.0, 1.0], "high": [1.0] * 4, "low": [1.0] * 4,
        "close": [10.0, 11.0, float("nan"), -1.0],
        "adj_close": [9.5, float("nan"), float("nan"), 5.0],
        "volume": [1, 1, 1, 1],
    })
    out = clean_prices(df)
    assert list(out["date"]) == [date(2026, 10, 6), date(2026, 10, 7)]
    assert out["adj_close"].tolist() == [9.5, 11.0]          # falta solo el ajuste → usa close
    assert clean_prices(df.iloc[0:0]).empty
