import { useEffect } from "react";
import parse from 'html-react-parser';

/*

    Use following states in parent component:

    const [infoMessage, setInfoMessage] = useState<string>(undefined);
    const [successMessage, setSuccessMessage] = useState<string>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>(undefined);

*/

function FeedbackMessage({ infoMessage, errorMessage, successMessage, loading }: { infoMessage: string, errorMessage: string, successMessage: string, loading: boolean }) {

    useEffect(() => {
        (async () => {

        })();
    }, [infoMessage, errorMessage, successMessage, loading]);

    return (
        <div className="block feedback-message">
            {
                infoMessage &&
                <div>
                    <article className="message is-info">
                        <div className="message-body">
                            {parse(infoMessage)}
                        </div>
                    </article>
                </div>
            }

            {
                errorMessage &&
                <div>
                    <article className="message is-danger">
                        <div className="message-body">
                            {parse(errorMessage)}
                        </div>
                    </article>
                </div>
            }

            {
                successMessage &&
                <div>
                    <article className="message is-success">
                        <div className="message-body">
                            {parse(successMessage)}
                        </div>
                    </article>
                </div>
            }
        </div>
    )
}

export default FeedbackMessage;