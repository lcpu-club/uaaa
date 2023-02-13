import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { UPI } from '../src/index.js'

chai.use(chaiAsPromised)
const assert = chai.assert

describe('UPI', () => {
  it('Valid UPIs', () => {
    assert.equal(new UPI('foo:bar').toString(), 'foo:bar')
    assert.equal(new UPI('foo:bar?baz=qux').toString(), 'foo:bar?baz=qux')
    assert.equal(new UPI('foo:bar/baz').toString(), 'foo:bar/baz')
    assert.equal(
      new UPI('foo:bar/baz?qux=quux').toString(),
      'foo:bar/baz?qux=quux'
    )
  })

  it('Invalid UPIs', () => {
    assert.throws(() => new UPI(''))
    assert.throws(() => new UPI('foo'))
    assert.throws(() => new UPI('foo:'))
    assert.throws(() => new UPI('foo:bar/'))
    assert.throws(() => new UPI('foo:bar/baz/'))
    assert.throws(() => new UPI('foo:/bar'))
    assert.throws(() => new UPI('foo:ba//r'))
  })

  it('Derived UPIs', () => {
    const base = new UPI('foo:bar/baz?qux=quux')
    assert.ok(base.canDerive(new UPI('foo:bar/baz?qux=quux')))
    assert.ok(base.canDerive(new UPI('foo:bar/baz?qux=quux&quux=quuz')))
    assert.ok(base.canDerive(new UPI('foo:bar/baz/qux?qux=quux')))
    assert.notOk(base.canDerive(new UPI('bar:bar/baz?qux=quux')))
    assert.notOk(base.canDerive(new UPI('foo:bar/bazz?qux=quux')))
    assert.notOk(base.canDerive(new UPI('foo:bar/baz?qux=quuz')))
  })
})
