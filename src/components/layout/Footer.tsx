import appDescription from '../../../package.json';
import config from "../../Config";

function Footer() {
    return (
        <>
            <footer className="footer">
                <div className="content has-text-centered">
                    <div className='columns'>
                        <div className='column'>
                            {appDescription.description} - v{appDescription.version}
                        </div>
                    </div>
                    {
                        config.githubRepositoryUrl &&
                        <div className='columns'>
                            <div className='column'>
                                <a href={config.githubRepositoryUrl} target="_blank" rel="noreferrer"> <i className="bi-github"></i> </a>
                            </div>
                        </div>
                    }
                </div>
            </footer>
        </>
    );
}

export default Footer;