import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { UPI, UPICollection } from '../src/index.js'

chai.use(chaiAsPromised)
const assert = chai.assert

describe('UPI', () => {
  it('Valid UPIs', () => {
    const o = new UPI('foo:bar')
    assert.equal(o.toString(), 'foo:bar')
    assert.equal(new UPI(o).toString(), 'foo:bar')
    assert.equal(new UPI('foo:bar?baz=qux').toString(), 'foo:bar?baz=qux')
    assert.equal(new UPI('foo:bar/baz').toString(), 'foo:bar/baz')
    assert.equal(new UPI('foo:bar/baz?qux=quux').toString(), 'foo:bar/baz?qux=quux')
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
    assert.notOk(base.canDerive(new UPI('foo:bar/baz?qux=quuxx')))
  })

  it('Derivation', () => {
    const base = new UPI('foo:bar/baz?qux=quux')
    assert.equal(base.derive('foo:bar/baz').toString(), 'foo:bar/baz?qux=quux')
    assert.equal(base.derive('foo:bar/baz/aaa').toString(), 'foo:bar/baz/aaa?qux=quux')
  })

  it('UPI Collection', () => {
    const collection = new UPICollection(['foo:bar/baz?qux=quux', 'abc:bar?a=1'])
    const { ok, notOk } = collection.tryDerive(['foo:bar/baz', 'foo:bar/baz/aaa', 'foo:baz', 'abc:bar/baz', 'ddd:bar'])
    assert.sameMembers(ok, ['foo:bar/baz?qux=quux', 'foo:bar/baz/aaa?qux=quux', 'abc:bar/baz?a=1'])
    assert.sameMembers(notOk, ['foo:baz', 'ddd:bar'])
  })
})
