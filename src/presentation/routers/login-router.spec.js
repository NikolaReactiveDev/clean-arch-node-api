const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')

describe('Login Router', () => {
  test('should return 400 if no email is provided in body of httpRequest parameter', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      // wrong request no email provided
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided in body of httpRequest parameter', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      // wrong request no password provided
      body: {
        email: 'any_email@gmail.com'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 500 if no httpRequest parameter provided', () => {
    const sut = new LoginRouter()
    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if httpRequest has no body', () => {
    const sut = new LoginRouter()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
