import http from 'http';

const data = JSON.stringify({ email: 'admin@stagepass.local', password: 'admin123' });

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    console.log('Token:', token ? 'Success' : 'Fail');
    
    // Now create a show
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const payload = `--${boundary}\r
Content-Disposition: form-data; name="title"\r
\r
Test Show\r
--${boundary}\r
Content-Disposition: form-data; name="description"\r
\r
Test description\r
--${boundary}\r
Content-Disposition: form-data; name="duration"\r
\r
120\r
--${boundary}\r
Content-Disposition: form-data; name="language"\r
\r
English\r
--${boundary}\r
Content-Disposition: form-data; name="genre"\r
\r
Theater\r
--${boundary}\r
Content-Disposition: form-data; name="venueIds"\r
\r
1\r
--${boundary}\r
Content-Disposition: form-data; name="timings"\r
\r
[{"venueId":1,"startTime":"2027-05-15T19:30","price":499}]\r
--${boundary}\r
Content-Disposition: form-data; name="posterUrl"\r
\r
https://example.com/poster.jpg\r
--${boundary}--\r
`;

    const createReq = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/shows',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (cRes) => {
      let cBody = '';
      cRes.on('data', chunk => cBody += chunk);
      cRes.on('end', () => console.log('Create Show Status:', cRes.statusCode, cBody));
    });
    createReq.write(payload);
    createReq.end();
  });
});
req.write(data);
req.end();
