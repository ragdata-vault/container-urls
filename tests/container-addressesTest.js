const chai = require('chai');
const sinon = require('sinon')
const rewire = require('rewire')
const Docker = require('dockerode');

const expect = chai.expect

const addresses = rewire('../src/container-addresses')

describe('Containers addresses', () => {
  const data = [
    {
      containers: [],
      data: [
        { Config: { Env: [] } },
      ],
      result: [],
    },
    {
      containers: ['c1'],
      data: [
        { Config: { Env: [] } },
      ],
      result: [],
    },
    {
      containers: ['c1'],
      data: [
        { Config: { Env: ['TEST=true'] } },
      ],
      result: [],
    },
    {
      containers: ['c1'],
      data: [
        { Config: { Env: ['TEST=true', 'VIRTUAL_HOST=example.com'] } },
      ],
      result: [['example.com']],
    },
    {
      containers: ['c1', 'c2'],
      data: [
        { Config: { Env: ['TEST=true', 'VIRTUAL_HOST=example.com'] } },
        { Config: { Env: ['VIRTUAL_HOST=example.com, test.net'] } },
      ],
      result: [['example.com'], ['example.com', 'test.net']],
    },
    {
      containers: ['c1', 'c2', 'c3', 'c4'],
      data: [
        { Config: { Env: ['TEST=true'] } },
        { Config: { Env: ['TEST=true', 'VIRTUAL_HOST=example.com'] } },
        { Config: { Env: [] } },
        { Config: { Env: ['VIRTUAL_HOST=example.com, test.net'] } },
      ],
      result: [['example.com'], ['example.com', 'test.net']],
    },
  ]

  data.forEach((testData, index) => {
    it(`test ${index + 1}`, async () => {
      const stub = sinon.createStubInstance(Docker, {
        listContainers: Promise.resolve(testData.containers),
      })

      for (let i = 0; i < testData.data.length; i += 1) {
        stub.getContainer.onCall(i).returns({ inspect: () => Promise.resolve(testData.data[i]) })
      }

      addresses.__set__('docker', stub)

      const result = await addresses()

      expect(result).to.eql(testData.result)
    })
  })
})
