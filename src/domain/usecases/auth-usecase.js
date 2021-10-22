const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  constructor (loadUserByEmailRepository, encrypter) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypter
  }

  async auth (email, password) {
    if (!email) throw new MissingParamError('email')

    if (!password) throw new MissingParamError('password')

    if (!this.loadUserByEmailRepository) throw new MissingParamError('LoadUserByEmailRepository')
    if (!this.loadUserByEmailRepository.load) throw new InvalidParamError('LoadUserByEmailRepository')
    const user = await this.loadUserByEmailRepository.load(email)

    if (!user) return null
    const isValid = await this.encrypter.compare(password, user.password)
    if (!isValid) return null

    return isValid
  }
}
