const bcrypt = require('bcrypt')

class Encrypter {
  async compare (value, hashedValue) {
    const isValid = await bcrypt.compare(value, hashedValue)
    return isValid
  }
}

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
})