const bcrypt = require('bcrypt')

class Encrypter {
  async compare (value, hashedValue) {
    const isValid = await bcrypt.compare(value, hashedValue)
    return isValid
  }
}

describe('Encrypter', () => {
  test('should retrun true if bcrypt returns true', async () => {
    const sut = new Encrypter()
    const isValid = await sut.compare('any_password', 'hashed_password')
    expect(isValid).toBe(true)
  })

  test('should retrun false if bcrypt returns false', async () => {
    const sut = new Encrypter()
    bcrypt.isValid = false
    const isValid = await sut.compare('any_password', 'hashed_password')
    expect(isValid).toBe(false)
  })
})
