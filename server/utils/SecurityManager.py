from flask_talisman import *
import flask


class SecurityHeaderManager(Talisman):
    def __init__(self, app: flask.Flask, **kwargs):
        super().__init__(app, **kwargs)

        self.cache_control = kwargs["cache_control"] if kwargs["cache_control"] else None

    def init_app(self, app: flask.Flask, **kwargs):
        if kwargs["cache_control"]:
            del kwargs["cache_control"]

        super().init_app(app, **kwargs)

    def _set_response_headers(self, response) -> flask.Response:
        res = super()._set_response_headers(response)

        if self.cache_control:
            res.headers['Cache-Control'] = self.cache_control

        return res
