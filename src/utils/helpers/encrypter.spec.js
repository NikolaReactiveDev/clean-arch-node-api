const bcrypt = require('bcrypt')
const MissingParamError = require('../errors/missing-param-error')
const Encrypter = require('./encrypter')

const makeSut = () => {
  return new Encrypter()
}

describe('Encrypter', () => {
  test('should retrun true if bcrypt returns true', async () => {
    const sut = makeSut()
    const isValid = await sut.compare('any_password', 'hashed_password')
    expect(isValid).toBe(true)
  })

  test('should retrun false if bcrypt returns false', async () => {
    const sut = makeSut()
    bcrypt.isValid = false
    const isValid = await sut.compare('any_password', 'hashed_password')
    expect(isValid).toBe(false)
  })

  test('should call bcrypt with correct values', async () => {
    const sut = makeSut()
    bcrypt.compare = jest.fn()
    await sut.compare('any_password', 'hashed_password')
    expect(bcrypt.compare).toBeCalledWith('any_password', 'hashed_password')
  })

  test('should throw if no params are provided', async () => {
    const sut = makeSut()
    expect(sut.compare()).rejects.toThrow(new MissingParamError('value'))
    expect(sut.compare('any_password')).rejects.toThrow(new MissingParamError('hashedValue'))
  })
})
