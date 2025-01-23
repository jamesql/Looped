export default class Snowflake {
    // Snowflake is a 64-bit integer
    // 42 bits for time in milliseconds
    // 10 bits for a machine id
    // 12 bits for a sequence number
    private static readonly EPOCH: number = 1420070400000;
    private static readonly MACHINE_ID: number = 0;
    private static readonly MAX_MACHINE_ID: number = 1023;
    private static readonly SEQUENCE_BITS: number = 12;
    private static readonly MAX_SEQUENCE: number = 4095;
    private static readonly MACHINE_ID_SHIFT: number = 12;
    private static readonly TIMESTAMP_LEFT_SHIFT: number = 22;
    private static lastTimestamp: number = -1;
    private static sequence: number = 0;
    private static generateTimestamp(): number {
        let timestamp: number = Date.now();
        if (Snowflake.lastTimestamp === timestamp) {
            Snowflake.sequence = (Snowflake.sequence + 1) & Snowflake.MAX_SEQUENCE;
            if (Snowflake.sequence === 0) {
                timestamp = Snowflake.tilNextMillis(Snowflake.lastTimestamp);
            }
        } else {
            Snowflake.sequence = 0;
        }
        if (timestamp < Snowflake.lastTimestamp) {
            throw new Error("Clock moved backwards. Refusing to generate id for " + (Snowflake.lastTimestamp - timestamp) + " milliseconds");
        }
        Snowflake.lastTimestamp = timestamp;
        return timestamp;
    }

    private static tilNextMillis(lastTimestamp: number): number {
        let timestamp: number = Date.now();
        while (timestamp <= lastTimestamp) {
            timestamp = Date.now();
        }
        return timestamp;
    }

    public static generate(): string {
        let timestamp: number = Snowflake.generateTimestamp();
        return ((timestamp - Snowflake.EPOCH) << Snowflake.TIMESTAMP_LEFT_SHIFT).toString(2) + (Snowflake.MACHINE_ID << Snowflake.MACHINE_ID_SHIFT).toString(2) + Snowflake.sequence.toString(2);
    }

}