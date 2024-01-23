import { Suspense, lazy } from "react";
import Loading from "./Loading";

const Proposals = lazy(() => import("./business/proposal/Proposals"));

function Content() {

    return (
        <div className="content">
            <Suspense fallback={<Loading />}>
                <Proposals />
            </Suspense>
        </div>
    );
}

export default Content;