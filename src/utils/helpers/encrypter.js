const bcrypt = require('bcrypt')
const MissingParamError = require('../errors/missing-param-error')

module.exports = class Encrypter {
  async compare (value, hashedValue) {
    if (!value) throw new MissingParamError('value')
    if (!hashedValue) throw new MissingParamError('hashedValue')
    const isValid = await bcrypt.compare(value, hashedValue)
    return isValid
  }
}
