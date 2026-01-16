# app/core/elo.py

# K-FACTOR: Determines how volatile the ranking is. 
# 32 is standard for chess. Higher = wilder swings.
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