# Guidelines
This is an example of a permanent installation on a Linux server (with systemd):

- Install the necessary dependencies (if you haven't already): `npm` and
`nodejs`
- Move the main folder to `/usr/local/lib/` and run `npm install` there
- Move `ricettario.sh` to `/usr/local/bin/ricettario` and make sure it's
executable
- Move the unit file (`ricettario.service`) to `/etc/systemd/system/`
- Start end anable the daemon:
```
# systemctl daemon-reload
# systemctl start ricettario
# systemctl enable ricettario
```
At this stage, the website will be running on port `8000`.

It is recommended to backup regularly the database. `ricettario-backup.sh` is
a script you can use to create a copy of it every time it is modified.