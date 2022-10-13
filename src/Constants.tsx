const APPLIED = 'applied';
const FAILED = 'failed';

const PERIOD_PROPOSAL = "proposal";
const PERIOD_EXPLORATION = "exploration";
const PERIOD_TESTING = "testing";

enum Period {
    PROPOSAL = "proposal",
    EXPLORATION = "exploration",
    TESTING = "testing",
    PROMOTION = "promotion",
    ADOPTION = "adoption",
    NONE = "none"
}

enum BallotValue {
    YAY = 'yay',
    NAY = 'nay',
    PASS = 'pass'
}

export default { BallotValue, Period, APPLIED, FAILED };