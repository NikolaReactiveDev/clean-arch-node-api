const AuthUseCase = require('./auth-usecase')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

const makeTokenGenerator = () => {
  class TokenGenerator {
    async generate (userId) {
      return this.accessToken
    }
  }
  const tokenGenerator = new TokenGenerator()
  tokenGenerator.accessToken = 'any_token'
  return tokenGenerator
}
const makeTokenGeneratorWithError = () => {
  class TokenGenerator {
    async generate (userId) {
      throw new Error('TokenGenerator Error')
    }
  }
  const tokenGenerator = new TokenGenerator()
  return tokenGenerator
}
const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepository {
    async update (userId, accessToken) {

    }
  }
  return new UpdateAccessTokenRepository()
}
const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepository {
    async update (userId, accessToken) {
      throw new Error('UpdateAccessTokenRepository Error')
    }
  }
  return new UpdateAccessTokenRepository()
}
const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }

  const encrypter = new EncrypterSpy()
  encrypter.isValid = true
  return encrypter
}

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      throw new Error('Encrypter Error')
    }
  }

  const encrypter = new EncrypterSpy()
  return encrypter
}
const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      return this.user
    }
  }
  const loadUserByEmailRepository = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepository.user = {}
  return loadUserByEmailRepository
}
const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      throw new Error('LoadUserByEmailRepository Error')
    }
  }
  const loadUserByEmailRepository = new LoadUserByEmailRepositorySpy()
  return loadUserByEmailRepository
}
const makeSut = () => {
  const tokenGenerator = makeTokenGenerator()
  const encrypter = makeEncrypter()
  const loadUserByEmailRepository = makeLoadUserByEmailRepository()
  const updateAccessTokenRepository = makeUpdateAccessTokenRepository()
  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepository,
    updateAccessTokenRepository: updateAccessTokenRepository,
    encrypter: encrypter,
    tokenGenerator: tokenGenerator
  })
  return {
    sut,
    loadUserByEmailRepository,
    updateAccessTokenRepository,
    encrypter,
    tokenGenerator
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
    const sut = new AuthUseCase({})
    const provided = { email: 'any_email@gmail.com', password: 'any_password' }
    const promise = sut.auth(provided.email, provided.password)
    expect(promise).rejects.toThrow(new MissingParamError('LoadUserByEmailRepository'))
  })

  test('should throw if no dependency is provided', async () => {
    const sut = new AuthUseCase()
    const provided = { email: 'any_email@gmail.com', password: 'any_password' }
    const promise = sut.auth(provided.email, provided.password)
    expect(promise).rejects.toThrow()
  })

  test('should throw if LoadUserByEmailRepsotory has no load method', async () => {
    const sut = new AuthUseCase({ loadUserByEmailRepository: {} })
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

  test('should return null if invalid email is provided', async () => {
    const { sut, loadUserByEmailRepository } = makeSut()
    loadUserByEmailRepository.user = null
    const provided = { email: 'invalid_email@gmail.com', password: 'valid_password' }
    const result = await sut.auth(provided.email, provided.password)
    expect(result).toBeNull()
  })

  test('should return null if invalid password is provided', async () => {
    const { sut, encrypter } = makeSut()
    encrypter.isValid = false
    const provided = { email: 'valid_email@gmail.com', password: 'invalid_password' }
    const result = await sut.auth(provided.email, provided.password)
    expect(result).toBeNull()
  })

  test('should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepository, encrypter } = makeSut()
    encrypter.compare = jest.fn()
    loadUserByEmailRepository.user = { password: 'hashed_password' }
    const provided = { email: 'any_email@gmail.com', password: 'any_password' }
    await sut.auth(provided.email, provided.password)
    expect(encrypter.compare).toBeCalledWith(provided.password, loadUserByEmailRepository.user.password)
  })

  test('should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepository, tokenGenerator } = makeSut()
    tokenGenerator.generate = jest.fn()
    loadUserByEmailRepository.user = { id: 'uuidv4', password: 'hashed_password' }
    const provided = { email: 'any_email@gmail.com', password: 'any_password' }
    await sut.auth(provided.email, provided.password)
    expect(tokenGenerator.generate).toBeCalledWith(loadUserByEmailRepository.user.id)
  })

  test('should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGenerator } = makeSut()
    const provided = { email: 'valid_email@gmail.com', password: 'valid_password' }
    const accessToken = await sut.auth(provided.email, provided.password)
    expect(accessToken).toBe(tokenGenerator.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, loadUserByEmailRepository, updateAccessTokenRepository, tokenGenerator } = makeSut()
    updateAccessTokenRepository.update = jest.fn()
    await sut.auth('valid_email@mail.com', 'valid_password')
    expect(updateAccessTokenRepository.update).toBeCalledWith(loadUserByEmailRepository.user.id, tokenGenerator.accessToken)
  })

  test('should throw if invalid dependecies are provided', () => {
    // example can further be updated for all dependencies..
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({ loadUserByEmailRepository: {} })
    )
    for (const sut of suts) {
      const promise = sut.auth('any_email@mail.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })

  test('should throw if dependency throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository: loadUserByEmailRepository,
        encrypter: makeEncrypterWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository: loadUserByEmailRepository,
        encrypter: encrypter,
        tokenGenerator: makeTokenGeneratorWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository: loadUserByEmailRepository,
        encrypter: encrypter,
        tokenGenerator: tokenGenerator,
        updateAccessTokenRepository: makeUpdateAccessTokenRepositoryWithError()
      })
    )

    for (const sut of suts) {
      const promise = sut.auth('any_email@mail.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })
})
