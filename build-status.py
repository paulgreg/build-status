import cgi
import datetime
import os

import webapp2
from google.appengine.ext import db
from google.appengine.ext.webapp import template


class Build(db.Model):
  app_name = db.StringProperty(multiline=False)
  has_passed = db.BooleanProperty()
  last_update = db.DateTimeProperty(auto_now_add=True)


def getBuild(app_name):
  builds = Build.gql("WHERE app_name = :1", app_name)
  if builds.count():
    build = builds.get()
  else:
    build = Build()
    build.app_name = app_name
    build.has_passed = False
    build.put()
  return build


def gotoHome(self):
  self.response.out.write(template.render(os.path.join(os.path.dirname(__file__), 'home.html'), { } ))

def render(self, app_name, page):
  build = getBuild(app_name)

  if build.has_passed:
    build.status = "pass"
    build.passed = "true"
  else:
    build.status = "fail"
    build.passed = "false"

  build.current_time = datetime.datetime.now()

  path = os.path.join(os.path.dirname(__file__), page)
  self.response.out.write(template.render(path,	{ 'build': build } ))


class MainPage(webapp2.RequestHandler):
  def get(self):
    app_name = self.request.get('app_name')

    if not app_name:
      gotoHome(self)
    else:
      render(self, app_name, 'action.html');


def updatePage(self, status):
  app_name = self.request.get('app_name')

  if not app_name:
    gotoHome(self)
  else:
    build = getBuild(app_name)
    build.has_passed = status
    build.last_update = datetime.datetime.now()
    build.put()
    self.redirect('/?app_name=' + app_name)


class UpdateToPassedPage(webapp2.RequestHandler):
  def get(self):
    updatePage(self, True)


class UpdateToFailedPage(webapp2.RequestHandler):
  def get(self):
    updatePage(self, False)


class GetJsonState(webapp2.RequestHandler):
  def get(self):
    app_name = self.request.get('app_name')

    if not app_name:
      self.response.out.write('Parameter "app_name" is mandatory !')
    else:
      self.response.headers['Content-Type'] = 'application/json'
      render(self, app_name, 'state.js')


app = webapp2.WSGIApplication(
    [('/', MainPage),
     ('/pass', UpdateToPassedPage),
     ('/fail', UpdateToFailedPage),
     ('/state', GetJsonState)])

