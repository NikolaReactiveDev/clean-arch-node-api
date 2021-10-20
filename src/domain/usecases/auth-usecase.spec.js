const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  async auth (email, password) {
    if (!email) throw new MissingParamError('email')

    if (!password) throw new MissingParamError('password')
  }
}

const makeSut = () => {
  return new AuthUseCase()
}

describe('Auth UseCase', () => {
  test('should throw if no email is provided', async () => {
    const sut = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('should throw if no password is provided', async () => {
    const sut = makeSut()
    const promise = sut.auth('any_email@gmail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })
})
