const Docker = require('dockerode');

require('dotenv').load()

const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
});

const variableContainsHostNames = process.env.VARIABLE_CONTAINS_HOST_NAMES || 'VIRTUAL_HOST'

function getContainerAddresses(containerId) {
  return docker
    .getContainer(containerId)
    .inspect()
    .then(data => data.Config.Env.filter(
      item => item.indexOf(variableContainsHostNames) > -1,
    ))
}

function convertArrayOfStringsToArrayOfArrays(input) {
  return input
    .map(item => item
      .pop()
      .replace(`${variableContainsHostNames}=`, '')
      .split(',')
      .map(address => address.trim()))
}

function arrayOfAddresses() {
  return docker.listContainers()
    .then(containers => containers.map(element => getContainerAddresses(element.Id)))
    .then(addresses => Promise.all(addresses))
    .then(list => list.filter(item => item.length > 0))
    .then(list => convertArrayOfStringsToArrayOfArrays(list))
    .catch((err) => {
      throw new Error(err)
    })
}

module.exports = arrayOfAddresses
