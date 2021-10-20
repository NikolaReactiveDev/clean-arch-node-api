const validator = require('validator')

const makeSut = () => {
  class EmailValidator {
    isValid (email) {
      return validator.isEmail(email)
    }
  }
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const sut = makeSut()
    const isEmailValid = sut.isValid('valid_email@gmail.com')
    expect(isEmailValid).toBe(true)
  })

  test('should return false if validator returns false', () => {
    validator.isEmailValid = false
    const sut = makeSut()
    const isEmailValid = sut.isValid('invalid_email.com')
    expect(isEmailValid).toBe(false)
  })

  test('should call validator with correct email', () => {
    const sut = makeSut()
    validator.isEmail = jest.fn()
    const providedEmail = 'some_email@gmail.com'
    sut.isValid(providedEmail)
    expect(validator.isEmail).toBeCalledWith(providedEmail)
  })
})
