require("dotenv").config(); // Load environment variables
const logger = require("../utils/logger"); // Ensure this is the correct path to your logger
const { getTopTokenHolders } = require("../services/vybeApi/topTokenHolder");

/**
 * Test the getTopTokenHolders function by fetching top holders for a specified token mint address.
 * @returns {Promise<void>} A promise that resolves when the test is complete.
 */
async function testGetTopTokenHolders() {
  try {
    // Test Configuration
    const testConfiguration = {
      mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // Replace with a valid mint address
      options: {
        page: 0,
        limit: 10,
        sortBy: "valueUsd",
        ascending: false,
      },
    };

    // Log Test Start
    logger.info("=== Starting Test for getTopTokenHolders ===");
    logger.info(
      `Testing with configuration: ${JSON.stringify(
        testConfiguration,
        null,
        2
      )}`
    );

    // Execute Test
    const topHolders = await getTopTokenHolders(
      testConfiguration.mintAddress,
      testConfiguration.options
    );

    // Log Test Results
    logger.info("=== Test Results ===");
    logger.info(`Fetched ${topHolders.length} top holders.`);

    // Display Each Holder
    if (topHolders.length > 0) {
      topHolders.forEach((holder, index) => {
        logger.info(`Holder ${index + 1}:`);
        logger.info(`  Rank: ${holder.rank}`);
        logger.info(`  Owner Name: ${holder.ownerName}`);
        logger.info(`  Owner Address: ${holder.ownerAddress}`);
        logger.info(`  Value USD: ${holder.valueUsd}`);
        logger.info(`  Balance: ${holder.balance}`);
        logger.info(
          `  Percentage of Supply Held: ${holder.percentageOfSupplyHeld}`
        );
      });
    } else {
      logger.warn(
        "No top holders were fetched, but the function executed without errors."
      );
    }

    // Test Verification
    if (topHolders.length > 0) {
      logger.info("Test passed: Successfully fetched top holders.");
    } else {
      logger.warn(
        "Test warning: No top holders were fetched, but the function executed without errors."
      );
    }
  } catch (error) {
    // Error Handling
    logger.error("=== Test Failed ===");
    logger.error(`Error message: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    throw error;
  } finally {
    // Test Completion
    logger.info("=== Test Execution Completed ===");
  }
}

// Execute the test
testGetTopTokenHolders()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error("Test execution failed.");
    process.exit(1);
  });
