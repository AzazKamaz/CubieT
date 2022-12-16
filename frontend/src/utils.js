import fetchRetry from 'fetch-retry';

export const retry = async (url) => fetchRetry(fetch)(url, {
    retryOn: [500],
    retries: 5,
    retryDelay: function (attempt, error, response) {
        return Math.min(Math.pow(2, attempt) * 200, 2000);
    }
});

