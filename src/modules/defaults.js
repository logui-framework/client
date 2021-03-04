const logUIdefaults = {
    verbose: true,  // Whether LogUI dumps events to console.log() or not.
    overrideEqualSpecificity: true, // If an existing event has equal specificity to the event being proposed, do we replace it (true, default) or replace it (false)?
    sessionUUID: null, // The session UUID to be used (null means no previous UUID has been used).
};

export default logUIdefaults;