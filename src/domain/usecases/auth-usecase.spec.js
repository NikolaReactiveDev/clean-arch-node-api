const AuthUseCase = require('./auth-usecase')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

const makeSut = () => {
  class LoadUserByEmailRepository {
    async load (email) {}
  }
  const loadUserByEmailRepository = new LoadUserByEmailRepository()
  const sut = new AuthUseCase(loadUserByEmailRepository)
  return {
    sut,
    loadUserByEmailRepository
  }
}

describe('Auth UseCase', () => {
  test('should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@gmail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('should call LoadUserByEmailRepository.load with correct email', async () => {
    const { sut, loadUserByEmailRepository } = makeSut()
    loadUserByEmailRepository.load = jest.fn()
    const provided = { email: 'any_email@gmail.com', password: 'any_password' }
    await sut.auth(provided.email, provided.password)
    expect(loadUserByEmailRepository.load).toBeCalledWith(provided.email)
  })

  test('should throw if no LoadUserByEmailRepsotory is provided', async () => {
    const sut = new AuthUseCase()
    const provided = { email: 'any_email@gmail.com', password: 'any_password' }
    const promise = sut.auth(provided.email, provided.password)
    expect(promise).rejects.toThrow(new MissingParamError('LoadUserByEmailRepository'))
  })

  test('should throw if LoadUserByEmailRepsotory has no load method', async () => {
    const sut = new AuthUseCase({})
    const provided = { email: 'any_email@gmail.com', password: 'any_password' }
    const promise = sut.auth(provided.email, provided.password)
    expect(promise).rejects.toThrow(new InvalidParamError('LoadUserByEmailRepository'))
  })

  test('should return null if LoadUserByEmailRepository returns null', async () => {
    const { sut, loadUserByEmailRepository } = makeSut()
    loadUserByEmailRepository.load = jest.fn(() => null)
    const provided = { email: 'invalid_email@gmail.com', password: 'invalid_password' }
    const result = await sut.auth(provided.email, provided.password)
    expect(result).toBeNull()
  })
})
