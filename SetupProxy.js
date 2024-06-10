const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // 기존 백엔드 서버로의 요청
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );

  app.use(
    '/socket', // 소켓 서버로의 요청
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      ws: true, // 웹소켓 지원을 위해 설정
      pathRewrite: { '^/socket': '' }, // '/socket' 경로를 제거하여 실제 소켓 서버 경로와 매핑
    })
  );
};
