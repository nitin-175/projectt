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
    
    // Now fetch all users to get their IDs
    http.get({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/users',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (gRes) => {
      let gBody = '';
      gRes.on('data', chunk => gBody += chunk);
      gRes.on('end', () => {
        const users = JSON.parse(gBody);
        
        const targetUserId = users.find(u => u.email === 'user@stagepass.local')?.id;
        
        if (!targetUserId) {
           console.log("Could not find user@stagepass.local");
           return;
        }

        // Try updating role to ORGANIZER
        const payload = JSON.stringify({
          roles: ["ORGANIZER"],
          venueIds: [1]
        });

        const putReq = http.request({
          hostname: 'localhost',
          port: 8080,
          path: `/api/admin/users/${targetUserId}/roles`,
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `application/json`,
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (cRes) => {
          let cBody = '';
          cRes.on('data', chunk => cBody += chunk);
          cRes.on('end', () => {
             const json = JSON.parse(cBody);
             console.log('Update User Roles Status:', cRes.statusCode);
             console.log('Error Message:', json.error);
          });
        });
        putReq.write(payload);
        putReq.end();
      });
    });
  });
});
req.write(data);
req.end();
