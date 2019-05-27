import app from 'flarum/app';
import { extend, override } from 'flarum/extend'
import UserControls from 'flarum/utils/UserControls'
import listItems from 'flarum/helpers/listItems'
import username from 'flarum/helpers/username'
import avatar from 'flarum/helpers/avatar'
import icon from 'flarum/helpers/icon'
import UserCard from 'flarum/components/UserCard'
import HeaderSecondary from 'flarum/components/HeaderSecondary'
import Dropdown from 'flarum/components/Dropdown'
import UserPage from 'flarum/components/UserPage'
import LoadingIndicator from 'flarum/components/LoadingIndicator';

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
  override(UserCard.prototype, 'view', function(original) {
    const user = this.props.user
    const controls = UserControls.controls(user, this).toArray()
    const color = user.color()
    const badges = user.badges().toArray()

    return (
      <div className={'UserCard ' + (this.props.className || '')}
        style={color ? {backgroundColor: color} : ''}>
        <div className="darkenBackground">
          <div className="container">
            {controls.length ? Dropdown.component({
              children: controls,
              className: 'UserCard-controls App-primaryControl',
              menuClassName: 'Dropdown-menu--right',
              buttonClassName: this.props.controlsButtonClassName,
              label: app.translator.trans('core.forum.user_controls.button'),
              icon: 'fas fa-ellipsis-v'
            }) : ''}

            <div className="UserCard-profile">
              <h2 class="UserCard-identity">
                <a href={app.route.user(user)} config={m.route}>
                  <div class="UserCard-avatar">
                    {avatar(user)}
                  </div>
                  {username(user)}
                </a>
              </h2>

              {badges.length ? (
                <ul className="UserCard-badges badges">
                  {listItems(badges)}
                </ul>
              ) : ''}

              <ul className="UserCard-info">
                {listItems(this.infoItems().toArray())}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  })
})

