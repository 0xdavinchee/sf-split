## Superfluid Splitter

### Prerequisite
- forge
- refer to `.env.example` for the necessary environment variables which should be placed in a newly created `.env` file.


### Libraries used
- forge-std
- openzeppelin-contracts
- superfluid-protocol-monorepo

### How to use

To compile your contracts: `forge build`

To test: `forge test`

To test with TDD: `forge test --watch`

To deploy your contracts: 
```
# To load the variables in the .env file
source .env

# To deploy and verify our contract
forge script script/FlowSplitterFactory.s.sol:FlowSplitterFactoryScript --rpc-url $RPC_URL --broadcast --verify -vvvv
```