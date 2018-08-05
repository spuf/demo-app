const http = require('http');
const fs = require('fs');
const os = require('os');

const datadir = process.env.DATADIR;
const port = process.env.PORT;
const hostname = os.hostname();

function lockWait(filename, cb, retry = 0) {
  const lockname = `${filename}.lock`;
  fs.open(lockname, 'wx', (err, fd) => {
    if (err) {
      if (retry > 30) {
        fs.stat(lockname, (err, stat) => {
          if (stat && stat.ctimeMs > 0 && stat.ctimeMs < Date.now() - 30000) {
            fs.unlink(lockname, () => {});
          }
        })
      }
      setImmediate(() => lockWait(filename, cb, retry + 1));
      return;
    }
    cb(() => {
      fs.close(fd, () => {});
      fs.unlink(lockname, () => {});
    })
  })
}

const server = http.createServer((req, res) => {
  console.log(req.url);
  if (req.url !== '/') {
    res.statusCode = 404;
    res.end();

    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

  const filename = `${datadir}/count.txt`;
  lockWait(filename, (done) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        data = 0;
      } else {
        data = parseInt(data) || 0;
      }
      data += 1;
      fs.writeFile(filename, data, 'utf8', (err) => {
        done();
        if (err) {
          data = err.toString();
        }
        res.end(`Hostname: ${hostname}\nCount: ${data}\n`);
      });
    });
  })
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${hostname}:${port}`);
});
