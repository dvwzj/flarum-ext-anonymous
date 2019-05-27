import app from 'flarum/app';
import { extend, override } from 'flarum/extend'
import HeaderSecondary from 'flarum/components/HeaderSecondary'
import UserPage from 'flarum/components/UserPage'

app.initializers.add('dvwzj-dev-anonymous', () => {
  window.$anonymous = {
    login(identification, password) {
      app.session.login({ identification, password, remember: true }, {
        errorHandler({responseText}) {
          console.error(responseText)
        }
      }).then(() => {
        window.location.reload()
      })
    }
  }
  app.route.discussion = (discussion, near) => {
    return app.route(near && near !== 1 ? 'discussion.near' : 'discussion', {
      id: discussion.id(),
      near: near && near !== 1 ? near : undefined
    })
  }
  extend(HeaderSecondary.prototype, 'items', function(items) {
    items.remove('logIn')
    items.remove('signUp')
    if (!app.forum.attribute('adminUrl')) {
      items.remove('session')
    }
  })
  extend(UserPage.prototype, 'navItems', function(items) {
    if (!app.forum.attribute('adminUrl')) {
      items.remove('settings')
      items.remove('separator')
    }
  })
})

