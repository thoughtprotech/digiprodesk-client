/* eslint-disable @typescript-eslint/no-explicit-any */
// TypeScript interfaces for the database schema

export interface User {
  UserName: string;
  Password: string;
  DisplayName: string;
  UserPhoto?: any;
  Role: string;
  Language?: string | null;
  Region?: string | null;
  TimeZone?: string | null;
  "24HourFormat"?: boolean | number;
  Calendar?: string | null;
  DateFormat?: string | null;
  IsActive: number;
  CreatedBy?: number;
  CreatedOn?: Date;
  ModifiedBy?: number;
  ModifiedOn?: Date;
  LocationGroupID?: number | null;
  LocationID?: number | null;
}

export interface Role {
  ID?: number;
  Name: string;
  SuperAdmin: boolean;
  Language: string;
  IsActive: boolean;
  CreatedBy: number;
  CreatedOn: Date;
  ModifiedBy: number;
  ModifiedOn: Date;
}

export interface RoleDetail {
  RoleID: number;
  Menu: string;
  Action: string;
  IsActive: boolean;
  CreatedBy: number;
  CreatedOn: Date;
  ModifiedBy: number;
  ModifiedOn: Date;
}

export interface Menu {
  Menu: string;
  Language: string;
  IsActive: boolean;
  CreatedBy: number;
  CreatedOn: Date;
  ModifiedBy: number;
  ModifiedOn: Date;
}

export interface Action {
  Action: string;
  IsActive: boolean;
  Language: string;
}

export interface UserInterface {
  UserInterfaceKey: string;
  UserInterfaceText: string;
  CaptionKey: string;
  CaptionText: string;
  Language: string;
  IsActive: boolean;
}

export interface Message {
  MessageKey: number;
  Message: string;
  Language: string;
  IsActive: boolean;
}

export interface License {
  LicenseID: number;
  LicenseKey: string;
  CustomerID: string;
  ProductID: string;
  LicenseType: string;
  ValidFrom: Date;
  ValidTo: Date;
  LicenseCost: number;
  MaxUsers: number;
  Comments: string;
  Status: string;
  CreatedDate: Date;
  LastUpdated: Date;
}

export interface Location {
  LocationID?: number;
  LocationName: string;
  LocationCode: string;
  LocationParentID?: number;
  LocationType: string;
  LocationTheme?: string;
  LocationLogo?: any;
  LocationImage?: any;
  LocationBanner?: any;
  LocationVideoFeed?: string;
  LocationReceptionistPhoto?: any;
  LocationAdvertisementVideo?: string;
  IsActive: number;
  CreatedBy?: number;
  CreatedOn?: Date;
  ModifiedBy?: number;
  ModifiedOn?: Date;
}

export interface LocationGroup {
  LocationGroupId?: number;
  LocationGroupName: string;
  IsActive: number;
  CreatedBy?: number;
  CreatedOn?: Date;
  ModifiedBy?: number;
  ModifiedOn?: Date;
  Locations?: Location[];
}

export interface LocationGroupMapping {
  LocationGroupID: number;
  LocationID: number[];
}

export interface UserLocationGroup {
  UserName: string;
  LocationGroupID: number;
  CreatedBy: number;
  CreatedOn: Date;
  ModifiedBy: number;
  ModifiedOn: Date;
}

export interface UserPreferredLocation {
  UserName: string;
  LocationID: number;
}

export interface Call {
  CallID: string;
  CallStartDateTime?: string | null;
  CallEndDateTime?: string | null;
  CallStatus?:
    | "New"
    | "In Progress"
    | "On Hold"
    | "Completed"
    | "Cancelled"
    | "Purged"
    | "Error";
  CallPlacedByUserName?: string | null;
  CallPlacedByLocationID?: number;
  CallAssignedTo?: string | null;
  CallTransferredTo?: string | null;
  CallBookingID?: string;
  CallDocumentUploadStatus?: "Success" | "Error" | null;
  CallNotes?: string;
  CallVideoProcessingStatus?:
    | "To Do"
    | "Pending"
    | "Processing"
    | "Completed"
    | "Error";
  CallAnalyticsStatus?: "To Do" | "Completed" | "Cancelled";
  CallRank?: number | null;
  CallAnalytics?: string;
  CallReport?: string;
  CallDocuments?: string;
  CreatedBy?: string | null;
  CreatedOn?: string;
  ModifiedBy?: string;
  ModifiedOn?: string;
  CallPlacedByLocation: Location | null;
}

export interface CallLog {
  ID: number;
  CallID: string;
  Type: "Initiated" | "Start" | "On Hold" | "Resume" | "Transfer" | "Error";
  CallTimeStamp: Date;
  EndTime: Date;
}
