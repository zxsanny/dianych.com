# Screen index

`copy_locale`: uk
`BASE_URL`: http://localhost:3000

| id | route | auth | file | status |
|----|-------|------|------|--------|
| storefront | `/` | public | `screens/storefront.md` | states-complete |
| login | `/login` | public | `screens/login.md` | states-complete |
| manage | `/manage` | required | `screens/manage.md` | states-complete |
| logout | `/logout` | public | `screens/logout.md` | states-complete |

Hash sections `#brooches` `#frames` `#felting` `#kits` `#contact` are storefront scenarios. GET `/logout` is 404; session end is POST from manage.
