import {ApiRequest, ApiResponse, ApiServer, HttpMethod, ValoryMetadata} from "valory-runtime";
import slimjim = require("slimjim");

const pathReplacer = /{([\S]*?)}/g;

export class SlimJimAdaptor implements ApiServer {
    public allowDocSite = true;
    public disableSerialization = false;
    public locallyRunnable = true;
    private server = new slimjim.SlimJim();

    public register(path: string, method: HttpMethod,
                    handler: (request: ApiRequest) => Promise<ApiResponse>) {
        const route = `${path}:${HttpMethod[method]}`;
        path = path.replace(pathReplacer, ":$1");
        this.server.endpoint(HttpMethod[method] as slimjim.HttpMethod, path, (req, done) => {
            const transRequest = new ApiRequest({
               body: req.body,
               formData: req.body,
               query: req.query,
               path: req.params,
               rawBody: req.rawBody,
               headers: req.headers,
               route,
            });

            handler(transRequest).then((response) => {
                done(null, response);
            });
        });
    }

    public getExport(metadata: ValoryMetadata, options: any): {valory: ValoryMetadata} {
        this.server.start(options.port || process.env.PORT, options.host || process.env.HOST);
        return {valory: metadata};
    }

    public shutdown() {
        return;
    }
}
