import http from 'http';

const options = {
  host: 'localhost',
  port: process.env.PORT || '3000',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 1 : 0);
});

request.on('error', () => {
  process.exit(1);
});

request.end();
