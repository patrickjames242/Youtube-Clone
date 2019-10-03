
export function NetworkResponseFailure(errorMessage){
    return NetworkResponse.failure(errorMessage);
}

export function NetworkResponseSuccess(result){
    return NetworkResponse.success(result);
}

export default class NetworkResponse {

    constructor(status, info) {
        this.status = status;
        switch (status) {
            case NetworkResponse.successStatus:
                this.result = info;
                break;
            case NetworkResponse.failureStatus:
                this.errorMessage = String(info);
                break;
        }
    }

    static success(result) {
        return new NetworkResponse(this.successStatus, result);
    }

    static failure(errorMessage) {
        return new NetworkResponse(this.failureStatus, errorMessage);
    }

    static get successStatus() { return "success"; }
    static get failureStatus() { return "failure"; }


    /// transformer will accept the old success value as a parameter and should return the new success value.
    mapSuccess(transformer) {
        if (typeof transformer !== "function") { return this; }
        if (this.status === NetworkResponse.successStatus) {
            return NetworkResponse.success(transformer(this.result));
        } else {
            return this;
        }
    }

    // transformer will accept the old success value as a parameter and should return a completely new NetworkResponse object.
    flatMapSuccess(transformer) {
        if (typeof transformer !== "function") { return this; }
        if (this.status === NetworkResponse.successStatus) {
            return transformer(this.result);
        } else {
            return this;
        }
    }

}



