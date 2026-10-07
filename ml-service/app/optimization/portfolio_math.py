"""
Utilidades matemáticas compartidas para todos los algoritmos de optimización
(GA, PSO, DE).  Ningún archivo de algoritmo importa numpy/sklearn directamente
para estadísticos; todo pasa por aquí.

Referencia TT:
  §4.5.1 Modelo de Markowitz
  §4.5.2 Estimador de Ledoit-Wolf
  §4.6.1 Función objetivo y restricciones
"""
from __future__ import annotations

import numpy as np
from sklearn.covariance import LedoitWolf


# ---------------------------------------------------------------------------
# Retornos
# ---------------------------------------------------------------------------

def log_returns(prices: np.ndarray) -> np.ndarray:
    """
    Calcula retornos logarítmicos diarios.

    Args:
        prices: (T, N) — serie de precios ajustados (T días, N activos).

    Returns:
        (T-1, N) matriz de retornos log.
    """
    return np.log(prices[1:] / prices[:-1])


def historical_mean_return(prices: np.ndarray, trading_days: int = 252) -> np.ndarray:
    """
    μ histórico anualizado a partir de retornos log.

    Args:
        prices:       (T, N)
        trading_days: días de trading al año (252 para acciones).

    Returns:
        (N,) vector de retornos esperados anualizados.
    """
    r = log_returns(prices)
    return r.mean(axis=0) * trading_days


# ---------------------------------------------------------------------------
# Covarianza — Ledoit-Wolf
# ---------------------------------------------------------------------------

def ledoit_wolf_cov(prices: np.ndarray, trading_days: int = 252) -> np.ndarray:
    """
    Matriz de covarianza anualizada usando el estimador de Ledoit-Wolf
    (shrinkage hacia la identidad × varianza media).

    Reduce el error de estimación en muestras pequeñas, que es el caso
    habitual en carteras de inversión con ventanas de 1-5 años.

    Args:
        prices:       (T, N)
        trading_days: días de trading al año.

    Returns:
        (N, N) matriz de covarianza anualizada.
    """
    r = log_returns(prices)
    lw = LedoitWolf().fit(r)
    return lw.covariance_ * trading_days


# ---------------------------------------------------------------------------
# Función objetivo (fitness)
# ---------------------------------------------------------------------------

def portfolio_return(weights: np.ndarray, mu: np.ndarray) -> float:
    """Retorno esperado del portafolio: w^T μ."""
    return float(weights @ mu)


def portfolio_variance(weights: np.ndarray, sigma: np.ndarray) -> float:
    """Varianza del portafolio: w^T Σ w."""
    return float(weights @ sigma @ weights)


def portfolio_std(weights: np.ndarray, sigma: np.ndarray) -> float:
    """Desviación estándar del portafolio."""
    return float(np.sqrt(portfolio_variance(weights, sigma)))


def sharpe_ratio(weights: np.ndarray, mu: np.ndarray, sigma: np.ndarray,
                 risk_free: float = 0.0) -> float:
    """
    Sharpe ratio: (μ_p - r_f) / σ_p.

    Retorna -inf si σ_p ≈ 0 para penalizar carteras degeneradas.
    """
    std = portfolio_std(weights, sigma)
    if std < 1e-10:
        return -np.inf
    return (portfolio_return(weights, mu) - risk_free) / std


def markowitz_utility(weights: np.ndarray, mu: np.ndarray, sigma: np.ndarray,
                       risk_aversion: float = 1.0) -> float:
    """
    Función de utilidad cuadrática de Markowitz:
        U = μ_p - (λ/2) σ²_p

    Con λ > 0.  Maximizar U equivale a la frontera eficiente parametrizada por λ.
    Retorna el negativo para que los algoritmos puedan minimizar.
    """
    utility = portfolio_return(weights, mu) - (risk_aversion / 2.0) * portfolio_variance(weights, sigma)
    return -utility  # negativo → minimizar


def fitness(weights: np.ndarray, mu: np.ndarray, sigma: np.ndarray,
            objective: str = "sharpe", risk_aversion: float = 1.0,
            risk_free: float = 0.0) -> float:
    """
    Función de fitness unificada para todos los algoritmos.

    objective:
      "sharpe"       → maximiza Sharpe (retorna valor negativo para minimizadores)
      "min_variance" → minimiza varianza
      "utility"      → maximiza utilidad cuadrática de Markowitz

    Todos los algoritmos MINIMIZAN el valor devuelto.
    """
    if objective == "sharpe":
        return -sharpe_ratio(weights, mu, sigma, risk_free)
    elif objective == "min_variance":
        return portfolio_variance(weights, sigma)
    elif objective == "utility":
        return markowitz_utility(weights, mu, sigma, risk_aversion)
    else:
        raise ValueError(f"objective desconocido: {objective!r}. Usa 'sharpe', 'min_variance' o 'utility'.")


# ---------------------------------------------------------------------------
# Reparación de soluciones (proyección al simplex con restricciones)
# ---------------------------------------------------------------------------

def repair(
    w: np.ndarray,
    w_min: np.ndarray,
    w_max: np.ndarray,
    max_assets: int | None = None,
) -> np.ndarray:
    """
    Proyecta un vector arbitrario al conjunto factible
        { w : sum(w) = 1,  w_min <= w <= w_max,  #{w_i > 0} <= K }.

    Pasos:
      1. Cardinalidad: soporte = activos con w_min > 0 (obligatorios) + los de mayor
         peso hasta completar K. El resto queda fijo en 0.
      2. Ajuste a suma 1 respetando cotas: reescala iterativamente los activos libres
         (no saturados) y, como cierre exacto, reparte el residuo según el margen
         disponible. Garantiza cotas y suma = 1 si el problema es factible.

    Raises:
        ValueError: si no existe solución factible.
    """
    w = np.asarray(w, dtype=float)
    n = len(w)
    lo = np.asarray(w_min, dtype=float).copy()
    hi = np.asarray(w_max, dtype=float).copy()

    if max_assets is not None and max_assets < n:
        forced = lo > 0
        n_forced = int(forced.sum())
        if n_forced > max_assets:
            raise ValueError("Infactible: más activos con peso mínimo > 0 que max_assets.")
        support = forced.copy()
        order = np.argsort(-w)
        for idx in order:
            if support.sum() >= max_assets:
                break
            support[idx] = True
        lo = np.where(support, lo, 0.0)
        hi = np.where(support, hi, 0.0)

    if lo.sum() > 1.0 + 1e-9 or hi.sum() < 1.0 - 1e-9:
        raise ValueError("Infactible: las cotas no permiten suma de pesos = 1.")

    w = np.clip(w, lo, hi)

    for _ in range(50):
        diff = 1.0 - w.sum()
        if abs(diff) < 1e-12:
            return w
        free = (w < hi - 1e-15) if diff > 0 else (w > lo + 1e-15)
        s = w[free].sum()
        if not free.any() or s < 1e-15:
            break
        target = s + diff
        w[free] = np.clip(w[free] * (target / s), lo[free], hi[free])

    # Cierre exacto: repartir el residuo proporcionalmente al margen disponible
    diff = 1.0 - w.sum()
    if abs(diff) > 1e-12:
        room = (hi - w) if diff > 0 else (w - lo)
        total_room = room.sum()
        if total_room < abs(diff) - 1e-12:
            raise ValueError("Infactible: no se pudo ajustar la suma a 1.")
        w = w + np.sign(diff) * abs(diff) * room / total_room
    return w
