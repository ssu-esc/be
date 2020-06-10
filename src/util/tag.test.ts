import { getTrackNumber } from './tag';

describe('트랙 넘버 검사', () => {
  test(`빈 트랙 넘버는 숫자 0을 반환한다.`, () => {
    expect(getTrackNumber()).toBe(0);
  });
  test(`트랙 넘버가 '1'이면 숫자 1을 반환한다.`, () => {
    expect(getTrackNumber('1')).toBe(1);
  });
  test(`트랙 넘버가 '2/7'이면 숫자 2를 반환한다.`, () => {
    expect(getTrackNumber('2/7')).toBe(2);
  });
  test(`트랙 넘버가 유효하지 않은 값 'asdf'이면 숫자 0을 반환한다.`, () => {
    expect(getTrackNumber('asdf')).toBe(0);
  });
});
