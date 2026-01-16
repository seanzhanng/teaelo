K_FACTOR = 32

def calculate_expected_score(rating_a: int, rating_b: int) -> float:
    """
    Returns the probability (0.0 to 1.0) of Player A winning against Player B.
    """
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def calculate_new_ratings(winner_elo: int, loser_elo: int) -> tuple[int, int]:
    """
    Takes current ELOs and returns the NEW ELOs for (winner, loser).
    """
    # 1. Calculate expected win probability
    expected_win = calculate_expected_score(winner_elo, loser_elo)
    expected_loss = calculate_expected_score(loser_elo, winner_elo)

    # 2. Calculate new ratings
    # Winner gets points based on how "surprising" the win was
    new_winner_elo = winner_elo + K_FACTOR * (1 - expected_win)
    
    # Loser loses points
    new_loser_elo = loser_elo + K_FACTOR * (0 - expected_loss)

    return round(new_winner_elo), round(new_loser_elo)

def get_tier_from_elo(elo: int) -> str:
    """
    Returns the Rank Tier based on ELO score.
    """
    if elo >= 1300:
        return "S"
    elif elo >= 1200:
        return "A"
    elif elo >= 1100:
        return "B"
    else:
        return "C"