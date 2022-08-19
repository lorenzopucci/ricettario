# Guidelines
This is an example of a permanent installation on a Linux server (with systemd):

- Install the necessary dependencies (if you haven't already): `npm` and
`nodejs`
- Move the main folder to `/usr/local/lib/` and run `npm install` there
- Move the unit file (`ricettario.service`) to `/etc/systemd/system/`
- Start end anable the daemon:
```
# systemctl daemon-reload
# systemctl start ricettario
# systemctl enable ricettario
```
At this stage, the website will be running on port `8000`.