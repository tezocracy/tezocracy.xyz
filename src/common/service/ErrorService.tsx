export default abstract class ErrorService {
    private static errorMessages: Map<string, string> = new Map([
        ['source_not_in_vote_listings', 'You are not in vote listings. You may have registered as delegate after the proposal was injected.'],
        ['already_submitted_a_ballot', 'You already sbumitted a ballot.'],
        ['wrong_voting_period_kind', 'Wrong voting period kind.'],
    ]);

    static getErrorMessage(error: Error): string {

        for (const [pattern, message] of ErrorService.errorMessages) {
            if (error.message.includes(pattern)) {
                return message;
            }
        }
        return error.toString();
    }
}
