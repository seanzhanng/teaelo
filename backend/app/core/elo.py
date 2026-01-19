# app/core/elo.py

def get_k_factor(matches_played: int, current_rating: int) -> int:
    """
    Determines the volatility (K-Factor) of a brand based on its maturity and rank.
    """
    # 1. PLACEMENT PHASE: High volatility to find true rank quickly
    if matches_played < 15:
        return 60
    
    # 2. ELITE PHASE: Low volatility to stabilize top-tier leaderboards
    if current_rating >= 1300:
        return 16
        
    # 3. STANDARD PHASE: Normal volatility
    return 32

def calculate_expected_score(rating_a: int, rating_b: int) -> float:
    """
    Returns the probability (0.0 to 1.0) of A beating B.
    Using logistic curve base 10.
    """
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def calculate_new_ratings(
    rating_a: int, matches_a: int,
    rating_b: int, matches_b: int,
    is_tie: bool = False
) -> tuple[int, int]:
    """
    Calculates asymmetric ELO updates.
    Returns: (new_rating_a, new_rating_b)
    """
    # 1. Determine K-Factors for each brand individually
    k_a = get_k_factor(matches_a, rating_a)
    k_b = get_k_factor(matches_b, rating_b)

    # 2. Calculate Expected Win Probability
    expected_a = calculate_expected_score(rating_a, rating_b)
    expected_b = calculate_expected_score(rating_b, rating_a)

    # 3. Determine Actual Score
    if is_tie:
        score_a = 0.5
        score_b = 0.5
    else:
        score_a = 1.0 # Winner
        score_b = 0.0 # Loser

    # 4. Calculate Asymmetric Updates
    # We round to nearest integer to keep ELO clean
    new_rating_a = round(rating_a + k_a * (score_a - expected_a))
    new_rating_b = round(rating_b + k_b * (score_b - expected_b))

    return new_rating_a, new_rating_b

def get_tier_from_elo(elo: int) -> str:
    if elo >= 1400: return "Grandmaster" # S+
    elif elo >= 1300: return "S"
    elif elo >= 1200: return "A"
    elif elo >= 1100: return "B"
    elif elo >= 1000: return "C"
    else: return "D"