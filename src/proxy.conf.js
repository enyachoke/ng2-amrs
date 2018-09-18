const PROXY_CONFIG = [
    {
        context: [
            "/etl-latest",
            "/test-amrs"
        ],
        target: "https://ngx.ampath.or.ke",
        secure: false
    }
]

module.exports = PROXY_CONFIG;