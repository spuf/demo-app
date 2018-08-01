const http = require('http');
const fs = require('fs');

const port = process.env.PORT;

const server = http.createServer((req, res) => {
  if (req.url !== '/') {
    res.statusCode = 404;
    res.end();

    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  fs.readFile('/data/count.txt', 'utf8', (err, data) => {
    if (err) {
      data = 0;
    } else {
      data = parseInt(data);
    }
    data += 1;
    fs.writeFile('/data/count.txt', data, 'utf8', (err) => {
      if (err) {
        data = err.toString();
      }
      res.end(`Hostname: ${process.env.HOSTNAME}\nCount: ${data}\n`);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${port}`);
});
