export const APPLIED = 'applied';
export const FAILED = 'failed';

export const enum Period {
    PROPOSAL = "proposal",
    EXPLORATION = "exploration",
    COOLDOWN = "cooldown",
    TESTING = "testing",
    PROMOTION = "promotion",
    ADOPTION = "adoption",
    NONE = "none"
}

export const enum BallotValue {
    YAY = 'yay',
    NAY = 'nay',
    PASS = 'pass',
    NOT_VOTED = 'notvoted'
}