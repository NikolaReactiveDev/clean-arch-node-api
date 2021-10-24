const jwt = require('jsonwebtoken')
const MissingParamError = require('../errors/missing-param-error')
const TokenGenerator = require('./token-generator')

const makeSut = () => {
  return new TokenGenerator('secret')
}

describe('TokenGenerator', () => {
  test('should return null if JWT returns null', async () => {
    const sut = makeSut()
    jwt.token = null
    const token = await sut.generate('any_id')
    expect(token).toBeNull()
  })

  test('should return token if JWT returns token', async () => {
    const sut = makeSut()
    const token = await sut.generate('any_id')
    expect(token).toBe(jwt.token)
  })

  test('should call JWT with correct values', async () => {
    const sut = makeSut()
    await sut.generate('any_id')
    expect(jwt.id).toBe('any_id')
    expect(jwt.secret).toBe(sut.secret)
  })

  test('should throw if no secret or id are provided', async () => {
    const sut = makeSut()
    expect(sut.generate()).rejects.toThrow(new MissingParamError('id'))
    const sut2 = new TokenGenerator()
    expect(sut2.generate('any_token')).rejects.toThrow(new MissingParamError('secret'))
  })
})
