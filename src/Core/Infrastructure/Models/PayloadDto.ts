import { instanceToPlain, plainToInstance } from 'class-transformer'

export default abstract class PayloadDto<ApplicationType> {
    /**
     * @description Maps the domain entity to the infrastructure layer model. This method is used in the constructor.
     * @param payload
     */
    abstract transform(payload: ApplicationType): unknown

    constructor(payload: ApplicationType) {
        // Get the transformed object
        const props = this.transform(payload)

        // Assign all properties to this instance
        Object.assign(this, props)
    }

    toPlain() {
        // When using instanceToPlain with excludeExtraneousValues: true,
        // only properties decorated with @Expose() will be included
        // You might consider changing this to false if you're having issues
        return instanceToPlain(this, {
            excludeExtraneousValues: false, // Changed to false to include all properties
        })
    }
}
