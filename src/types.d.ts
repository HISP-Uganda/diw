declare module 'd2';
declare module '@dhis2/analytics';
declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}