import { PasswordMatch, passwordMatchValidator } from './password-match.directive';

describe('PasswordMatch', () => {
  it('should create an instance', () => {
    const directive = new PasswordMatch();
    expect(directive).toBeTruthy();
  });
});
