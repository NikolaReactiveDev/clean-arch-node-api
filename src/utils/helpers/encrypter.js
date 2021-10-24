const bcrypt = require('bcrypt')

module.exports = class Encrypter {
  async compare (value, hashedValue) {
    const isValid = await bcrypt.compare(value, hashedValue)
    return isValid
  }
}
